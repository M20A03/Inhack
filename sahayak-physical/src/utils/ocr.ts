export async function performOCR(_file: File): Promise<string> {
  return new Promise((resolve) => {
    console.log('Simulating PaddleOCR WASM processing...');
    setTimeout(() => {
      // Mocked offline OCR for fast, reliable demo
      resolve("The quick brown fox jumps over the lazy dog. Total: $15.50.");
    }, 1200);
  });
}
