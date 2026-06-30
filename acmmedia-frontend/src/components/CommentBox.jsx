import { useState } from "react";
import { POSTS } from "../constants/copy";
import { SendIcon } from "./ui/Icons";

const CommentBox = ({ onAdd }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText("");
  };

  return (
    <div className="comment-box" style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
      <label htmlFor="comment-input" className="sr-only">Write a comment</label>
      <input
        id="comment-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={POSTS.COMMENTS_PLACEHOLDER}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        aria-label="Write a comment"
        style={{ flex: 1, padding: "0.6rem 0.8rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", background: "var(--color-white)", color: "var(--color-text)", fontSize: "13px" }}
      />
      <button
        onClick={handleSubmit}
        aria-label="Submit comment"
        style={{ padding: "0.6rem 1rem", background: "var(--color-primary)", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}
      >
        <SendIcon size={13} /> {POSTS.COMMENTS_BUTTON}
      </button>
    </div>
  );
};

export default CommentBox;
