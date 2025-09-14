import re
import os
import json
from google.cloud import aiplatform
from flask import Flask, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from vertexai.preview.generative_models import GenerativeModel
# Thêm thư viện Flask-CORS để xử lý CORS chuyên nghiệp hơn
from flask_cors import CORS

# Khởi tạo Firebase
# Tự động tìm thông tin xác thực từ môi trường Google Cloud
try:
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    # Xử lý lỗi nếu không thể kết nối Firebase
    print(f"Lỗi khi khởi tạo Firebase: {e}")
    db = None

# Khởi tạo ứng dụng Flask
app = Flask(__name__)
# Sử dụng Flask-CORS để xử lý CORS
CORS(app)  # Áp dụng cho toàn bộ ứng dụng

# Thiết lập location chung
location = 'us-central1'


def get_gemini_model():
    """Hàm helper để khởi tạo mô hình Gemini."""
    try:
        project_id = os.environ.get('GOOGLE_CLOUD_PROJECT_ID')
        if not project_id:
            raise ValueError("GOOGLE_CLOUD_PROJECT_ID not set")

        aiplatform.init(project=project_id, location=location)

        # Trả về đối tượng mô hình GenerativeModel
        return GenerativeModel("gemini-2.5-pro")

    except Exception as e:
        print(f"Error getting Gemini model: {e}")
        return None


# Định nghĩa route cho hàm xử lý hóa đơn
@app.route('/process_invoice_text', methods=['POST'])
def process_invoice_text():
    try:
        request_json = request.get_json(silent=True)
        if not request_json or 'invoiceContent' not in request_json:
            return jsonify({"error": "No invoice content provided"}), 400

        invoice_content = request_json['invoiceContent']
        model = get_gemini_model()
        if model is None:
            return jsonify({"error": "Failed to load Gemini model"}), 500

        prompt = f"""
        Phân tích đoạn văn bản hóa đơn GTGT sau đây.
        Trích xuất các thông tin: "Ngày", "Số Hóa Đơn", "Tên Hàng Hóa", "Số Lượng", "Đơn Giá", "Thuế Suất", "Tổng Tiền (đã bao gồm thuế)", "Tên người mua", "Tên người bán".

        Lưu ý:
        1. Đối với "Tên Hàng Hóa", "Số Lượng", "Đơn Giá", "Thuế Suất", hãy trả về dưới dạng một mảng các đối tượng, mỗi đối tượng đại diện cho một mặt hàng.
        2. Tên người bán, nếu là "CÔNG TY CỔ PHẦN KỸ THUẬT PHẦN MỀM CÔNG NGHỆ CAO PHỔ HIỀN", đây là hóa đơn bán ra. Ngược lại là mua vào. Hãy thêm trường "Loại Hóa Đơn" và gán giá trị "Mua vào" hoặc "Bán ra".
        3. Tổng tiền thanh toán (đã bao gồm thuế) là giá trị "Tổng tiền thanh toán bằng số".
        4. "Ngày" phải được định dạng lại thành DD/MM/YYYY.

        Trả về kết quả dưới dạng một đối tượng JSON duy nhất.

        Nội dung hóa đơn:
        ---
        {invoice_content}
        ---
        """
        response = model.generate_content(prompt)
        gemini_response_text = response.text.strip()

        # Use regex to find the JSON object and extract it
        json_match = re.search(r'\{.*\}', gemini_response_text, re.DOTALL)
        if json_match:
            json_string = json_match.group(0)
            parsed_data = json.loads(json_string)
        else:
            return jsonify({"error": "No valid JSON found in model response"}), 500

        # Ghi dữ liệu đã xử lý vào Firestore
        if db:
            doc_ref = db.collection('invoices').document()
            doc_ref.set(parsed_data)

        return jsonify({"success": True, "docId": doc_ref.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Định nghĩa route cho hàm xử lý sao kê
@app.route('/process_bank_statement', methods=['POST'])
def process_bank_statement():
    try:
        request_json = request.get_json(silent=True)
        if not request_json or 'statementContent' not in request_json:
            return jsonify({"error": "No statement content provided"}), 400

        statement_content = request_json['statementContent']
        model = get_gemini_model()
        if model is None:
            return jsonify({"error": "Failed to load Gemini model"}), 500

        prompt = f"""
        Tôi có một đoạn văn bản sao kê ngân hàng. Hãy trích xuất các giao dịch và trả về dưới dạng một mảng JSON. Mỗi đối tượng trong mảng cần có các trường: `ngay`, `so_tien`, và `noi_dung`. `so_tien` sẽ là giá trị âm nếu là giao dịch ghi nợ và dương nếu là giao dịch ghi có. `ngay` phải được định dạng lại thành DD/MM/YYYY. Bỏ qua các dòng không phải là giao dịch như tiêu đề hoặc dòng tổng kết.

        Ví dụ JSON trả về:
        [
          {{
            "ngay": "25/12/2024",
            "so_tien": 1192,
            "noi_dung": "TRA LAI TIEN GUI TK: 57021506868"
          }},
          {{
            "ngay": "23/12/2024",
            "so_tien": -8000000,
            "noi_dung": "Tam ung HD bao duong MFD so 04-HDKT"
          }}
        ]

        Nội dung sao kê:
        ---
        {statement_content}
        ---
        """
        response = model.generate_content(prompt)
        gemini_response_text = response.text.strip()

        # Use regex to find the JSON array and extract it
        json_match = re.search(r'\[.*\]', gemini_response_text, re.DOTALL)
        if json_match:
            json_string = json_match.group(0)
            parsed_data = json.loads(json_string)
        else:
            return jsonify({"error": "No valid JSON found in model response"}), 500

        # Ghi dữ liệu đã xử lý vào Firestore
        if db:
            doc_ref = db.collection('bank_transactions').document()
            doc_ref.set({"transactions": parsed_data})

        return jsonify({"success": True, "docId": doc_ref.id})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
