#!/bin/bash
cd /home/bolgac/projects/conservancy-game && mkdir -p papers-src
# 1. ICUAS25 (have it)
cp /home/bolgac/projects/sdu-applications/positions/lundquist/wildops/kenya-icuas25.pdf papers-src/ 2>/dev/null
# 2. energy-aware planning (arXiv)
curl -sL "http://export.arxiv.org/api/query?search_query=all:%22Energy-Aware%20Planning-Scheduling%20for%20Autonomous%20Aerial%20Robots%22&max_results=3" -o papers-src/arxiv-q.xml
ID=$(grep -o 'arxiv.org/abs/[0-9v.]*' papers-src/arxiv-q.xml | head -1 | sed 's|arxiv.org/abs/||')
[ -n "$ID" ] && curl -sL "https://arxiv.org/pdf/$ID" -o papers-src/energy-iros22.pdf
# 3. wildlife noise review (preprints.org)
curl -sL "https://www.preprints.org/manuscript/202501.2124/v1/download" -o papers-src/noise-review.pdf
# 4. U-space multi-UAV planning 2024 (SDU portal search via openalex oa url)
curl -s "https://api.openalex.org/works?filter=title.search:Towards%20Autonomous%20Multi-UAV%20U-Space%20Operation%20Planning&select=title,open_access,primary_location" -o papers-src/uspace-q.json
# 5. reverse execution 2015 via openalex
curl -s "https://api.openalex.org/works?filter=title.search:Automatic%20error%20recovery%20in%20robot%20assembly%20reverse%20execution&select=title,open_access,primary_location" -o papers-src/reverse-q.json
ls -la papers-src/
