import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
  to?: string;
}

function BackButton({ label = "Volver", to }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-6"
    >
      <span className="text-xl">←</span>
      {label}
    </button>
  );
}

export default BackButton;
