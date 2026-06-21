#!/usr/bin/env python3
"""Make LibreOffice-exported PDFs byte-reproducible so they can be committed.

LibreOffice stamps each export with a creation date, a per-export
/DocChecksum (in the trailer), and a random /ID. This rewrites each PDF with
a fixed date, drops the checksum, and regenerates a deterministic
(content-derived) /ID, so re-exporting an unchanged card yields an identical
file and git only shows a diff when the design actually changes.

Usage: normalize_pdf.py file1.pdf [file2.pdf ...]
"""
import sys
import pikepdf
from pikepdf import Name, String

FIXED_DATE = "D:20200101000000+00'00'"  # arbitrary but constant


def normalize(path):
    pdf = pikepdf.open(path, allow_overwriting_input=True)
    pdf.docinfo[Name.CreationDate] = String(FIXED_DATE)
    if Name.ModDate in pdf.docinfo:
        pdf.docinfo[Name.ModDate] = String(FIXED_DATE)
    # LibreOffice-specific per-export checksum lives in the trailer.
    if Name("/DocChecksum") in pdf.trailer:
        del pdf.trailer[Name("/DocChecksum")]
    # Drop the random /ID so deterministic_id regenerates both halves from content.
    if Name.ID in pdf.trailer:
        del pdf.trailer[Name.ID]
    pdf.save(path, deterministic_id=True)


if __name__ == "__main__":
    for p in sys.argv[1:]:
        normalize(p)
        print(f"normalized {p}")
