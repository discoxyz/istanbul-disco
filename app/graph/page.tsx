"use client";
import { ReactNode, useEffect, useState } from "react";

const Page = () => {
  const [graph, setGraph] = useState<ReactNode>();
  const [mode, setMode] = useState<"dark" | "light">();

  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const colorScheme = event.matches ? "dark" : "light";
        setMode(colorScheme);
      });
  }, []);

  useEffect(() => {
    if (!mode) return
    const handler = async () => {
      const { ForceGraph3D } = await import("react-force-graph");
      const resData = await fetch("/api/istanbul/getGraph", {
        method: "GET",
      });
      const data = await resData.json();
      if (mode == "dark") {
        setGraph(
          <ForceGraph3D
            graphData={data.data}
            nodeColor={() => "#FFFFFF"}
            linkColor={() => "rgba(255,255,255,0.8"}
            backgroundColor="rgba(24, 24, 27, 1)"
          />,
        );
        return;
      }

      setGraph(
        <ForceGraph3D
          graphData={data.data}
          nodeColor={() => "rgba(0,0,0,1)"}
          linkColor={() => "rgba(0,0,0,0.8)"}
          backgroundColor={"rgba(226, 232, 240, 1)"}
        />,
      );
    };
    handler();
  }, [mode]);

  return (
    <div className="fixed bottom-0 left-0 right-0 top-0">
      {graph && graph}
    </div>
  );
};

export default Page;
