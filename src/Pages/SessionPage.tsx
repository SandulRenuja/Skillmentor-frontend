import { useParams } from "react-router"

export default function SessionPage() {
  const { sessionId , sessionTitle} = useParams();

  return (
     <section>
      <h1>Session Details Page</h1>
      <p>This page will show the details of a specific session.</p>
      <p>Session ID is: {sessionId}</p>
      <p>Session Title is: {sessionTitle}</p>

      </section>
  )
}
