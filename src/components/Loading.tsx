import "./Loading.css"

function Loading() {
  return (
    <div className="loading-container">
      <div className="ice-cream">
        <div className="orbit">
          <div className="scoop scoop-1"></div>
          <div className="scoop scoop-2"></div>
          <div className="scoop scoop-3"></div>
        </div>

        <div className="cone"></div>
      </div>

      <p>Caricamento...</p>
    </div>
  )
}

export default Loading
