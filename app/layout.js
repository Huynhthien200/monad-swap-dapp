// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <h1>My Next.js App</h1>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2025 My App</p>
        </footer>
      </body>
    </html>
  );
}
