interface DeleteConfirmDialogProps {
  polygonName: string;
  childrenNames: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  polygonName,
  childrenNames,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const hasChildren = childrenNames.length > 0;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Delete</h3>

        <p>Are you sure you want to delete <strong>{polygonName}</strong>?</p>

        {hasChildren && (
          <div className="delete-warning">
            <p>This will also delete the following children:</p>
            <ul className="children-list">
              {childrenNames.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-delete" onClick={onConfirm}>
            Delete{hasChildren ? ` (${childrenNames.length + 1} items)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
