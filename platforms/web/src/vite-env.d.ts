/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module "*.learningmap?raw" {
  const content: string;
  export default content;
}
