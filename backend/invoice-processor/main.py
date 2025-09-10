import os
import json
from google.cloud import aiplatform
from flask import Flask, request, jsonify

# Khởi tạo ứng dụng Flask
app = Flask(__name__)

# Thiết lập location chung
location = 'asia-southeast1'


def get_gemini_model():
    """Hàm helper để khởi tạo mô hình Gemini."""
    project_id = os.environ.get('GOOGLE_CLOUD_PROJECT_ID')
    if not project_id:
        raise ValueError("GOOGLE_CLOUD_PROJECT_ID not set")
    aiplatform.init(project=project_id, location=location)
    return aiplatform.generative_models.GenerativeModel("gemini-pro")

# Định nghĩa route cho hàm xử lý hóa đơn


@app.route('/process_invoice_text', methods=['POST'])
def process_invoice_text():
    try:
        request_json = request.get_json(silent=True)
        if not request_json or 'invoiceContent' not in request_json:
            return jsonify({"error": "No invoice content provided"}), 400

        invoice_content = request_json['invoiceContent']
        model = get_gemini_model()

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
        start_index = gemini_response_text.find('{')
        end_index = gemini_response_text.rfind('}') + 1
        json_string = gemini_response_text[start_index:end_index]
        parsed_data = json.loads(json_string)

        return jsonify(parsed_data)

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
        start_index = gemini_response_text.find('[')
        end_index = gemini_response_text.rfind(']') + 1
        json_string = gemini_response_text[start_index:end_index]
        parsed_data = json.loads(json_string)

        return jsonify(parsed_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8080)))
