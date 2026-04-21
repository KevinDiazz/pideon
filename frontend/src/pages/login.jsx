import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/navbar";
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      // Redirección por rol si venían por un panel protegido
      if (from !== "/") {
        navigate(from, { replace: true });
      } else if (user.rol === "admin") {
        navigate("/admin");
      } else if (user.rol === "cocina") {
        navigate("/cocina");
      } else if (user.rol === "repartidor") {
        navigate("/repartidor");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo iniciar sesión. Revisa tus credenciales."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar></Navbar>
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-orange-100 p-8">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block text-3xl font-black text-orange-600">
            PideON
          </Link>
          <p className="text-amber-900/70 mt-1">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-amber-900 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-orange-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-amber-900/70 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-orange-600 font-semibold hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
    </>
  );
};

export default Login;
