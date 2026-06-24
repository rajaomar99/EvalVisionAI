import { generateReactHelpers } from "@uploadthing/react";

const serverUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api")
  .replace(/\/api$/, "");

const utUrl = `${serverUrl}/api/uploadthing`;

// Custom fetch that injects credentials for requests to our UploadThing route.
// This ensures the session cookie is forwarded so the server can authenticate.
const fetchWithCredentials = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  let urlString = "";
  if (typeof input === "string")  urlString = input;
  else if (input instanceof URL)  urlString = input.href;
  else if (input instanceof Request) urlString = input.url;

  if (urlString.includes("/api/uploadthing")) {
    if (input instanceof Request) {
      return fetch(new Request(input, { credentials: "include" }));
    }
    return fetch(input, { ...init, credentials: "include" });
  }
  return fetch(input, init);
};

export const { useUploadThing } = generateReactHelpers({
  url:   utUrl,
  fetch: fetchWithCredentials,
});
