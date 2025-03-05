export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Monad Swap DApp</title>
      </head>
      <body className="bg-gray-900 text-white">
        {children}
      </body>
    </html>
  );
}
