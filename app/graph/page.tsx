"use client";
import { ReactNode, useEffect, useState } from "react";

const Page = () => {
  const [graphData, setGraphData] = useState<any>();
  const [graph, setGraph] = useState<ReactNode>();
  useEffect(() => {
    const handler = async () => {
      const { ForceGraph2D } = await import("react-force-graph");
      const resData = await fetch("/api/istanbul/getGraph", {
        method: "GET",
      });
      const data = await resData.json();
      setGraphData(data.data);
      setGraph(<ForceGraph2D graphData={data.data} />);
    };
    handler();
  }, []);

  return (
    <div>
      {!graphData && "Loading"}
      {graph && graph}
    </div>
  );
};

export default Page;
