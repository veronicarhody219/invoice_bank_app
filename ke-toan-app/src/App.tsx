import { useState, useEffect, type ChangeEvent } from "react";
import "./App.css";
import {
  Container,
  TextField,
  Typography,
  Box,
  Paper,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import axios from "axios";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

// THAY THẾ DƯỚI ĐÂY BẰNG URL CLOUD RUN CỦA BẠN
const API_URL = "https://accounting-ai-api-390719125148.us-central1.run.app";

interface Status {
  message: string;
  type: "info" | "success" | "error";
}

interface Invoice {
  ngay: string;
  so_hoa_don: string;
  ten_hang: string;
  tong_tien: string;
  loai_hoa_don: string;
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Lắng nghe dữ liệu hóa đơn từ Firestore
  useEffect(() => {
    // Đảm bảo db được khởi tạo thành công
    if (!db) {
      console.error("Firebase is not initialized.");
      return;
    }
    const q = query(
      collection(db, "invoices"),
      orderBy("ngay", "desc"),
      limit(10)
    );

    // onSnapshot sẽ lắng nghe thay đổi theo thời gian thực
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedInvoices = snapshot.docs.map((doc) => ({
          ...doc.data(),
        })) as Invoice[];
        setInvoices(fetchedInvoices);
      },
      (error) => {
        console.error("Lỗi khi lấy dữ liệu Firestore:", error);
      }
    );

    // Dọn dẹp listener khi component bị hủy
    return () => unsubscribe();
  }, []); // useEffect này chỉ chạy một lần khi component được mount

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setContent("");
    setStatus(null);
  };

  const handlePaste = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      setStatus({ message: "Vui lòng dán nội dung vào ô", type: "error" });
      return;
    }

    setLoading(true);
    setStatus({
      message: "Đang xử lý... Vui lòng chờ.",
      type: "info",
    });

    const endpoint =
      activeTab === 0 ? "/process_invoice_text" : "/process_bank_statement";
    const payload =
      activeTab === 0
        ? { invoiceContent: content }
        : { statementContent: content };

    try {
      const response = await axios.post(`${API_URL}${endpoint}`, payload);
      if (response.data.success) {
        setStatus({
          message: `Dữ liệu đã được xử lý và lưu vào Firebase thành công! Document ID: ${response.data.docId}`,
          type: "success",
        });
        setContent("");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Lỗi xử lý:",
          error.response?.data?.error || error.message
        );
        setStatus({
          message: `Lỗi: ${error.response?.data?.error || error.message}`,
          type: "error",
        });
      } else {
        console.error("Lỗi không xác định:", error);
        setStatus({
          message: "Lỗi không xác định đã xảy ra.",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" className="app-container">
      <Typography variant="h4" component="h1" gutterBottom align="center">
        App Kế Toán AI Tự Động
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Dán nội dung vào đây
        </Typography>

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          centered
          sx={{ mb: 2 }}
        >
          <Tab label="Hóa đơn" />
          <Tab label="Sao kê Ngân hàng" />
        </Tabs>

        <TextField
          multiline
          fullWidth
          minRows={5}
          maxRows={15}
          variant="outlined"
          placeholder={
            activeTab === 0
              ? "Dán nội dung hóa đơn vào đây..."
              : "Dán nội dung sao kê ngân hàng vào đây..."
          }
          onChange={handlePaste}
          value={content}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !content.trim()}
          sx={{ width: "100%" }}
        >
          {loading ? "Đang xử lý..." : "Xử lý"}
        </Button>
        {loading && <LinearProgress sx={{ mt: 2 }} />}
        {status && (
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                color:
                  status.type === "success"
                    ? "success.main"
                    : status.type === "error"
                    ? "error.main"
                    : "text.secondary",
                fontWeight: "bold",
              }}
            >
              {status.message}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Danh sách Hóa đơn Gần đây
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="invoice table">
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Số Hóa Đơn</TableCell>
                <TableCell>Tên Hàng Hóa</TableCell>
                <TableCell>Tổng Tiền</TableCell>
                <TableCell>Loại Hóa Đơn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.ngay}</TableCell>
                    <TableCell>{invoice.so_hoa_don}</TableCell>
                    <TableCell>{invoice.ten_hang}</TableCell>
                    <TableCell>{invoice.tong_tien}</TableCell>
                    <TableCell>{invoice.loai_hoa_don}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có dữ liệu hóa đơn nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default App;
