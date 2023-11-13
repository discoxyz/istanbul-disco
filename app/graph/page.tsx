"use client";
import { ReactNode, useEffect, useState } from "react";

const Page = () => {
  const [graphData, setGraphData] = useState<any>();
  const [graph, setGraph] = useState<ReactNode>();
  useEffect(() => {
    const handler = async () => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const { ForceGraph3D } = await import("react-force-graph");
      const resData = await fetch("/api/istanbul/getGraph", {
        method: "GET",
      });
      const data = await resData.json();
      setGraphData(data.data);
      if (darkModeMediaQuery.matches) { 
        setGraph(<ForceGraph3D graphData={data.data} nodeColor={'#FFF'} linkColor='rgba(255,255,255,0.8'/>)
        return 
      }

      setGraph(<ForceGraph3D graphData={data.data} nodeColor={'#000'} linkColor='rgba(0,0,0,0.8'/>);
    };
    handler();
  }, []);

  return (
    <div className='fixed left-0 right-0 top-24 bottom-0 w-full h-screen'>
      {!graphData && "Loading"}
      {graph && graph}
    </div>
  );
};

export default Page;
