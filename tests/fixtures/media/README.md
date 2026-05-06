# Media Fixtures

MVP hardening tests generate small local files at runtime instead of committing private or license-sensitive media. The generated set covers:

- Valid PNG image
- Duplicate PNG content under a different filename
- Unsupported text content
- Damaged PNG-like content
- Zero-byte file
- Larger unsupported binary boundary

Additional JPEG, HEIC, MOV, and MP4 fixtures can be added here when they are small, redistributable, and stable across local media tooling.
