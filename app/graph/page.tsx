"use client";
import { ReactNode, useEffect, useState } from "react";

const Page = () => {
  const [graph, setGraph] = useState<ReactNode>();

  useEffect(() => {
    const handler = async () => {
      const { ForceGraph2D } = await import("react-force-graph");
      const resData = await fetch("/api/getGraph", {
        method: "GET",
      });
      const data = await resData.json();
      const dark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (dark) {
        setGraph(
          <ForceGraph2D
            graphData={data.data}
            nodeColor={() => "#FFFFFF"}
            linkColor={() => "rgba(255,255,255,0.8"}
            backgroundColor="rgba(24, 24, 27, 1)"
          />,
        );
        return;
      }

      setGraph(
        <ForceGraph2D
          graphData={data.data}
          nodeColor={() => "rgba(0,0,0,1)"}
          linkColor={() => "rgba(0,0,0,0.8)"}
          backgroundColor={"rgba(226, 232, 240, 1)"}
        />,
      );
    };
    handler();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0">{graph && graph}</div>
  );
};

export default Page;
