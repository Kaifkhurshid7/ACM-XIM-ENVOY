import React, { useState } from "react";

const CommentBox = ({ onAdd }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  return (
    <div className="comment-box" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text)", fontSize: "13px" }}
      />
      <button onClick={handleSubmit} style={{ padding: "0.6rem 1rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "13px", fontWeight: 600 }}>
        Post
      </button>
    </div>
  );
};

export default CommentBox;
