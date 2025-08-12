import { useState, useEffect } from "react";
import { FiArrowUp } from "react-icons/fi";
import './styles.css';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 225);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`scroll-to-top ${visible ? "visible" : ""}`}
      aria-label="Volver arriba"
    >
      <FiArrowUp size={20} />
    </button>
  );
}
