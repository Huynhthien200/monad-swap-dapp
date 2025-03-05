export default function Swap() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🔥 DApp Swap</h1>
      <div style={styles.card}>
        <input type="text" placeholder="From Token" style={styles.input} />
        <input type="text" placeholder="To Token" style={styles.input} />
        <button style={styles.button}>Swap Now 🚀</button>
      </div>
      <p style={styles.footer}>Made by Huynhthien200 ❤️</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    fontSize: "40px",
    color: "#ffffff",
    textShadow: "0px 0px 10px #00ffff",
  },
  card: {
    background: "#121212",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0px 0px 20px rgba(0, 255, 255, 0.5)",
    display: "inline-block",
  },
  input: {
    padding: "10px",
    marginBottom: "20px",
    width: "250px",
    borderRadius: "10px",
    border: "none",
    outline: "none",
  },
  button: {
    background: "#00ffff",
    color: "#121212",
    padding: "10px 20px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  footer: {
    marginTop: "20px",
    color: "#ffffff",
  },
};
