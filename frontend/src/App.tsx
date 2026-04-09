import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./presentation/routes/AppRouter";
import { login } from "./app/slices/authSlice";
import storageService from "./core/services/storage.service";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = storageService.getUser();
    const token = storageService.getToken();
    if (user && token) {
      dispatch(login(user));
    }
  }, [dispatch]);

  return <AppRouter />;
}

export default App;
