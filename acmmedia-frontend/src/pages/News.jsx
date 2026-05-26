/**
 * News Page
 * 
 * Displays external technology news in a grid layout.
 * Delegates rendering to the TechPulse component in "grid" mode.
 * 
 * @page
 */

import React from "react";
import TechPulse from "../components/TechPulse";

const News = () => {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-color)" }}>
      <TechPulse mode="grid" />
    </div>
  );
};

export default News;
