export default function ServerSidePage({ time }) {
  return (
    <div>
      <h1>Server Side Rendering Example</h1>
      <p>Current server time is: {time}</p>
    </div>
  );
}

// This runs on the server at every request
export async function getServerSideProps() {
  const currentTime = new Date().toLocaleString();

  return {
    props: {
      time: currentTime,
    },
  };
}
