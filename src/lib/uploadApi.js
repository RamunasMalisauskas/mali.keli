async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed.");
  }
  return body;
}

export function getSession() {
  return request("/api/session");
}

export function login(password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export function logout() {
  return request("/api/logout", { method: "POST", body: "{}" });
}

export function saveFooter(footer) {
  return request("/api/footer", {
    method: "PUT",
    body: JSON.stringify(footer),
  });
}

export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the image."));
    reader.onload = async () => {
      try {
        const body = await request("/api/image", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            data: reader.result,
          }),
        });
        resolve(body.src);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(file);
  });
}
