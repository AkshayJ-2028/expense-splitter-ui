import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Groups from "./Groups";
import GroupDetail from "./GroupDetail";

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/groups"
          element={
            <PrivateRoute>
              <Groups />
            </PrivateRoute>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <PrivateRoute>
              <GroupDetail />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/groups" />} />
      </Routes>
    </BrowserRouter>
  );
}