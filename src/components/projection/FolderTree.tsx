import type { FolderNode } from "../../types/candidate";

type FolderTreeProps = {
  nodes: FolderNode[];
};

const statusLabel = {
  present: "Présent",
  manquant: "Manquant",
  optionnel: "Optionnel",
  a_verifier: "À vérifier",
};

export function FolderTree({ nodes }: FolderTreeProps) {
  return (
    <div className="folder-tree">
      {nodes.map((node) => (
        <FolderTreeNode key={node.name} node={node} level={0} />
      ))}
    </div>
  );
}

function FolderTreeNode({ node, level }: { node: FolderNode; level: number }) {
  return (
    <div className="folder-node" style={{ marginLeft: `${level * 18}px` }}>
      <div className="folder-node-line">
        <span className="folder-icon">{node.type === "folder" ? "▾" : "•"}</span>
        <strong>{node.name}</strong>
        <span className={`status-chip ${node.status}`}>{statusLabel[node.status]}</span>
      </div>
      {node.children?.map((child) => (
        <FolderTreeNode key={`${node.name}-${child.name}`} node={child} level={level + 1} />
      ))}
    </div>
  );
}
