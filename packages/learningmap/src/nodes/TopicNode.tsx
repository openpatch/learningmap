import { Handle, Node, NodeResizer, Position } from "@xyflow/react";
import { NodeData } from "../types";
import StarCircle from "../icons/StarCircle";
import { getFontSizeValue } from "../fontSizes";

export const TopicNode = ({ data, selected, isConnectable }: Node<NodeData>) => {
  return (
    <>
      {isConnectable && <NodeResizer isVisible={selected} />}
      {data.state === "mastered" && <StarCircle className="icon" />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", textAlign: "center" }}>
        <div style={{ fontWeight: 600, fontSize: `${getFontSizeValue(data.fontSize)}px` }}>
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
          style={{ visibility: !isConnectable ? "hidden" : "visible" }}
          position={Position[pos]}
          id={pos.toLowerCase()}
          isConnectable={true}
        />
      ))}

      {["Bottom", "Top", "Left", "Right"].map((pos) => (
        <Handle
          key={`${pos}-target`}
          type="target"
          style={{ visibility: !isConnectable ? "hidden" : "visible" }}
          position={Position[pos]}
          id={pos.toLowerCase()}
          isConnectable={true}
        />
      ))}
    </>
  );
};
