"use client";
import { useEffect, useState } from "react";
import { ForceGraph2D } from "react-force-graph";

const Page = () => {
  const [graphData, setGraphData] = useState<any>();
  useEffect(() => {
    const handler = async () => {
      const resData = await fetch("/api/istanbul/getGraph", {
        method: "GET",
      });
      const data = await resData.json();
      console.log(data)
      setGraphData(data.data);
    };
    handler()
  }, []);

  return (
    <div>
      {!graphData && "Loading"}
      {graphData && <ForceGraph2D graphData={graphData} />}
    </div>
  );
};

export default Page;
