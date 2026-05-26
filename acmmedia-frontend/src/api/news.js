/**
 * News API Module
 * 
 * Fetches external technology news from the backend cache layer.
 * 
 * @module api/news
 */

import client from "./client";

/** Fetch cached technology news headlines */
export const fetchExternalNews = () => client.get("/external-news");
