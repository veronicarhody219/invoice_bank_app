import { useState, useEffect, type ChangeEvent } from "react";
import "./App.css";
import {
  Container,
  TextField,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";

// 1. Khai báo kiểu dữ liệu cho đối tượng Hóa đơn
interface Invoice {
  ngay: string;
  so_hoa_don: string;
  ten_hang: string;
  so_luong: string;
  don_gia: string;
  thue: string;
  tong_tien: string;
  kenh_thanh_toan: string;
}

function App() {
  // 2. Cung cấp kiểu dữ liệu cho useState
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  const fetchInvoices = async () => {
    setLoading(true);
    // Giả lập dữ liệu để hiển thị giao diện ban đầu
    const mockData: Invoice[] = [
      {
        ngay: "20/06/2025",
        so_hoa_don: "C25TYY-1",
        ten_hang: "Dầu động cơ, Lọc dầu, ...",
        so_luong: "...",
        don_gia: "...",
        thue: "8%, 10%",
        tong_tien: "38,228,300",
        kenh_thanh_toan: "Ngân hàng",
      },
      {
        ngay: "23/06/2025",
        so_hoa_don: "C25TYY-2",
        ten_hang: "Dầu động cơ, Lọc dầu, ...",
        so_luong: "...",
        don_gia: "...",
        thue: "8%, 10%",
        tong_tien: "8,322,000",
        kenh_thanh_toan: "Ngân hàng",
      },
      {
        ngay: "07/05/2025",
        so_hoa_don: "C25TUW-3",
        ten_hang: "Tổ máy phát điện Diesel",
        so_luong: "...",
        don_gia: "...",
        thue: "8%",
        tong_tien: "261,360,000",
        kenh_thanh_toan: "Ngân hàng",
      },
      {
        ngay: "26/02/2025",
        so_hoa_don: "C25TUW-2",
        ten_hang: "Sửa chữa máy phát điện",
        so_luong: "...",
        don_gia: "...",
        thue: "8%",
        tong_tien: "2,160,000",
        kenh_thanh_toan: "Ngân hàng",
      },
    ];
    setInvoices(mockData);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // 3. Khai báo kiểu dữ liệu cho tham số 'e'
  const handlePasteInvoice = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const pastedText = e.target.value;
    if (pastedText) {
      console.log("Nội dung hóa đơn đã dán:", pastedText);
      setStatusMessage(
        "Đang xử lý hóa đơn... Vui lòng kiểm tra Google Sheet của bạn sau ít phút."
      );
    }
  };

  return (
    <Container maxWidth="xl" className="app-container">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ my: 4 }}
      >
        App Kế Toán AI Tự Động
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Dán nội dung Hóa đơn vào đây
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Copy toàn bộ nội dung hóa đơn (Ctrl+A, Ctrl+C) và dán vào ô bên dưới.
          Ứng dụng sẽ tự động xử lý.
        </Typography>
        <TextField
          multiline
          fullWidth
          minRows={5}
          maxRows={10}
          variant="outlined"
          placeholder="Dán nội dung hóa đơn vào đây..."
          onChange={handlePasteInvoice}
          sx={{ mb: 2 }}
        />
        {statusMessage && (
          <Typography color="success.main" sx={{ mt: 2 }}>
            {statusMessage}
          </Typography>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Danh sách Hóa đơn Bán ra
        </Typography>
        <TableContainer component={Paper}>
          <Table aria-label="invoice table">
            <TableHead>
              <TableRow>
                <TableCell>Ngày</TableCell>
                <TableCell>Số Hóa Đơn</TableCell>
                <TableCell>Tên Hàng Hóa</TableCell>
                <TableCell>Tổng Tiền</TableCell>
                <TableCell>Kênh Thanh Toán</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              ) : invoices.length > 0 ? (
                invoices.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.ngay}</TableCell>
                    <TableCell>{invoice.so_hoa_don}</TableCell>
                    <TableCell>{invoice.ten_hang}</TableCell>
                    <TableCell>{invoice.tong_tien}</TableCell>
                    <TableCell>{invoice.kenh_thanh_toan}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Không có dữ liệu hóa đơn.
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
