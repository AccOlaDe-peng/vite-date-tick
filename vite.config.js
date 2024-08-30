/*
 * @description:
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-30 10:28:15
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: "0.0.0.0",
        port: 9999,
    },
});
