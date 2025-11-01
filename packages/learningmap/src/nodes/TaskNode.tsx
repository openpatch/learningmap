import { Handle, Node, NodeResizer, Position } from "@xyflow/react";
import { NodeData } from "../types";
import { CircleCheck } from "lucide-react";

export const TaskNode = ({ data, selected, isConnectable, ...props }: Node<NodeData>) => {
  return (
    <>
      {isConnectable && <NodeResizer isVisible={selected} />}
      <CircleCheck className="icon" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: data.fontSize ? `${data.fontSize}px` : "14px" }}>
          {data.label || "Untitled"}
        </div>
        {data.summary && (
          <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>
            {data.summary}
          </div>
        )}
      </div>

      {["Bottom", "Top", "Left", "Right"].map((pos) => (
        <Handle
          key={`${pos}-source`}
          type="source"
          position={Position[pos]}
          style={{ visibility: !isConnectable ? "hidden" : "visible" }}
          id={pos.toLowerCase()}
          isConnectable={true}
        />
      ))}

      {["Bottom", "Top", "Left", "Right"].map((pos) => (
        <Handle
          key={`${pos}-target`}
          type="target"
          position={Position[pos]}
          style={{ visibility: !isConnectable ? "hidden" : "visible" }}
          id={pos.toLowerCase()}
          isConnectable={true}
        />
      ))}
    </>
  );
};
