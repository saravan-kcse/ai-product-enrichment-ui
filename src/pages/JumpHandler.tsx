import React, { useEffect } from 'react';

interface Props {
  jumpTarget: { sheet?: string; attribute?: string; value?: string } | null;
  preview: any[];
  onHighlight: (rowId: string) => void;
}

const JumpHandler: React.FC<Props> = ({ jumpTarget, preview, onHighlight }) => {
  useEffect(() => {
    if (!jumpTarget) return;
    if (!preview || preview.length === 0) return;
    const { sheet, attribute, value } = jumpTarget;
    // find indices
    for (let si = 0; si < preview.length; si++) {
      const s = preview[si];
      if (sheet && s.sheet_name !== sheet) continue;
      for (let sec = 0; sec < (s.sections || []).length; sec++) {
        const section = s.sections[sec];
        if (attribute && section.attribute_name !== attribute) continue;
        for (let ri = 0; ri < (section.rows || []).length; ri++) {
          const row = section.rows[ri];
          if (value && row.attribute_value !== value) continue;
          const rowId = `allowable-row-${si}-${sec}-${ri}`;
          const el = document.getElementById(rowId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            onHighlight(rowId);
            return;
          }
        }
      }
    }
  }, [jumpTarget, preview, onHighlight]);
  return null;
};

export default JumpHandler;
