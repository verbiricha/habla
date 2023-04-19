import { useEffect, useState } from "react";

export default function useMouseUpSelection() {
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    function handleMouseUp() {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setSelectedText(selection.toString());
      }
    }

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return selectedText;
}
