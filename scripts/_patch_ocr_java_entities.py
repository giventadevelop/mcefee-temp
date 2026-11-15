#!/usr/bin/env python3
"""One-shot patcher: add ocrText/searchText to EventDetails, GalleryAlbum, FocusGroup Java layers."""
from pathlib import Path

ROOT = Path(r"F:\project_workspace\adwiise-agent-service\src\main\java\com\adwiiseagent")


def patch_file(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text(encoding="utf-8")
    if "private String ocrText;" in text and "ocrText" in label:
        # allow partial re-runs for criteria/query that check differently
        pass
    if old not in text:
        print(f"MISS [{label}]: {path}")
        return
    if new.strip() and new in text:
        print(f"SKIP already [{label}]: {path}")
        return
    path.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"OK [{label}]: {path.name}")


# ---------- EventDetails domain ----------
patch_file(
    ROOT / "domain/EventDetails.java",
    """    @Size(max = 900)
    @Column(name = "description", length = 900)
    private String description;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;""",
    """    @Size(max = 900)
    @Column(name = "description", length = 900)
    private String description;

    @Column(name = "ocr_text", columnDefinition = "text")
    private String ocrText;

    @Column(name = "search_text", columnDefinition = "text")
    private String searchText;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;""",
    "EventDetails fields",
)

patch_file(
    ROOT / "domain/EventDetails.java",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return this.ocrText;
    }

    public EventDetails ocrText(String ocrText) {
        this.setOcrText(ocrText);
        return this;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return this.searchText;
    }

    public EventDetails searchText(String searchText) {
        this.setSearchText(searchText);
        return this;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }

    public LocalDate getStartDate() {
        return this.startDate;
    }""",
    "EventDetails getters",
)

patch_file(
    ROOT / "domain/EventDetails.java",
    """, description='" + getDescription() + "'" +""",
    """, description='" + getDescription() + "'" +
                ", ocrText='" + getOcrText() + "'" +
                ", searchText='" + getSearchText() + "'" +""",
    "EventDetails toString",
)

# ---------- EventDetails DTO ----------
patch_file(
    ROOT / "service/dto/EventDetailsDTO.java",
    """    @Size(max = 900)
    private String description;

    @NotNull
    private LocalDate startDate;""",
    """    @Size(max = 900)
    private String description;

    private String ocrText;

    private String searchText;

    @NotNull
    private LocalDate startDate;""",
    "EventDetailsDTO fields",
)

patch_file(
    ROOT / "service/dto/EventDetailsDTO.java",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return searchText;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }

    public LocalDate getStartDate() {
        return startDate;
    }""",
    "EventDetailsDTO getters",
)

# ---------- EventDetails Criteria ----------
patch_file(
    ROOT / "service/criteria/EventDetailsCriteria.java",
    """    private StringFilter description;

    private LocalDateFilter startDate;""",
    """    private StringFilter description;

    private StringFilter ocrText;

    private StringFilter searchText;

    private LocalDateFilter startDate;""",
    "EventDetailsCriteria fields",
)

# ---------- EventDetails QueryService ----------
patch_file(
    ROOT / "service/EventDetailsQueryService.java",
    """            if (criteria.getDescription() != null) {
                specification = specification.and(buildStringSpecification(criteria.getDescription(), EventDetails_.description));
            }
            if (criteria.getStartDate() != null) {""",
    """            if (criteria.getDescription() != null) {
                specification = specification.and(buildStringSpecification(criteria.getDescription(), EventDetails_.description));
            }
            if (criteria.getOcrText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getOcrText(), EventDetails_.ocrText));
            }
            if (criteria.getSearchText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSearchText(), EventDetails_.searchText));
            }
            if (criteria.getStartDate() != null) {""",
    "EventDetailsQueryService",
)

# ---------- GalleryAlbum domain ----------
patch_file(
    ROOT / "domain/GalleryAlbum.java",
    """    @Column(name = "description", length = 2048)
    private String description;
""",
    """    @Column(name = "description", length = 2048)
    private String description;

    @Column(name = "ocr_text", columnDefinition = "text")
    private String ocrText;

    @Column(name = "search_text", columnDefinition = "text")
    private String searchText;
""",
    "GalleryAlbum fields",
)

patch_file(
    ROOT / "domain/GalleryAlbum.java",
    """    public void setDescription(String description) {
        this.description = description;
    }
""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return this.ocrText;
    }

    public GalleryAlbum ocrText(String ocrText) {
        this.setOcrText(ocrText);
        return this;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return this.searchText;
    }

    public GalleryAlbum searchText(String searchText) {
        this.setSearchText(searchText);
        return this;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }
""",
    "GalleryAlbum getters",
)

patch_file(
    ROOT / "domain/GalleryAlbum.java",
    """, description='" + getDescription() + "'" +""",
    """, description='" + getDescription() + "'" +
            ", ocrText='" + getOcrText() + "'" +
            ", searchText='" + getSearchText() + "'" +""",
    "GalleryAlbum toString",
)

# ---------- GalleryAlbum DTO ----------
patch_file(
    ROOT / "service/dto/GalleryAlbumDTO.java",
    """    private String description;
""",
    """    private String description;

    private String ocrText;

    private String searchText;
""",
    "GalleryAlbumDTO fields",
)

patch_file(
    ROOT / "service/dto/GalleryAlbumDTO.java",
    """    public void setDescription(String description) {
        this.description = description;
    }
""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return searchText;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }
""",
    "GalleryAlbumDTO getters",
)

# ---------- GalleryAlbum Criteria ----------
patch_file(
    ROOT / "service/criteria/GalleryAlbumCriteria.java",
    """    private StringFilter description;
""",
    """    private StringFilter description;

    private StringFilter ocrText;

    private StringFilter searchText;
""",
    "GalleryAlbumCriteria fields",
)

# Need getters/setters for GalleryAlbumCriteria - check if description has simple pattern
criteria_gal = (ROOT / "service/criteria/GalleryAlbumCriteria.java").read_text(encoding="utf-8")
if "getOcrText()" not in criteria_gal:
    old = """    public void setDescription(StringFilter description) {
        this.description = description;
    }
"""
    new = """    public void setDescription(StringFilter description) {
        this.description = description;
    }

    public StringFilter getOcrText() {
        return ocrText;
    }

    public void setOcrText(StringFilter ocrText) {
        this.ocrText = ocrText;
    }

    public StringFilter getSearchText() {
        return searchText;
    }

    public void setSearchText(StringFilter searchText) {
        this.searchText = searchText;
    }
"""
    if old in criteria_gal:
        (ROOT / "service/criteria/GalleryAlbumCriteria.java").write_text(
            criteria_gal.replace(old, new, 1), encoding="utf-8"
        )
        print("OK [GalleryAlbumCriteria getters]")
    else:
        print("MISS GalleryAlbumCriteria setters for description")

# ---------- GalleryAlbum QueryService ----------
patch_file(
    ROOT / "service/GalleryAlbumQueryService.java",
    """                specification = specification.and(buildStringSpecification(criteria.getDescription(), GalleryAlbum_.description));
""",
    """                specification = specification.and(buildStringSpecification(criteria.getDescription(), GalleryAlbum_.description));
            }
            if (criteria.getOcrText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getOcrText(), GalleryAlbum_.ocrText));
            }
            if (criteria.getSearchText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSearchText(), GalleryAlbum_.searchText));
""",
    "GalleryAlbumQueryService",
)

# Fix possible double brace from above - read and fix if broken
gq = (ROOT / "service/GalleryAlbumQueryService.java").read_text(encoding="utf-8")
# leave as-is if structure ok

# ---------- FocusGroup domain ----------
patch_file(
    ROOT / "domain/FocusGroup.java",
    """    private String description;

    @Size(max = 1024)
    @Column(name = "cover_image_url", length = 1024)
    private String coverImageUrl;""",
    """    private String description;

    @Column(name = "ocr_text", columnDefinition = "text")
    private String ocrText;

    @Column(name = "search_text", columnDefinition = "text")
    private String searchText;

    @Size(max = 1024)
    @Column(name = "cover_image_url", length = 1024)
    private String coverImageUrl;""",
    "FocusGroup fields",
)

patch_file(
    ROOT / "domain/FocusGroup.java",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverImageUrl() {
        return this.coverImageUrl;
    }""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return this.ocrText;
    }

    public FocusGroup ocrText(String ocrText) {
        this.setOcrText(ocrText);
        return this;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return this.searchText;
    }

    public FocusGroup searchText(String searchText) {
        this.setSearchText(searchText);
        return this;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }

    public String getCoverImageUrl() {
        return this.coverImageUrl;
    }""",
    "FocusGroup getters",
)

# ---------- FocusGroup DTO ----------
patch_file(
    ROOT / "service/dto/FocusGroupDTO.java",
    """    private String description;
""",
    """    private String description;

    private String ocrText;

    private String searchText;
""",
    "FocusGroupDTO fields",
)

patch_file(
    ROOT / "service/dto/FocusGroupDTO.java",
    """    public void setDescription(String description) {
        this.description = description;
    }
""",
    """    public void setDescription(String description) {
        this.description = description;
    }

    public String getOcrText() {
        return ocrText;
    }

    public void setOcrText(String ocrText) {
        this.ocrText = ocrText;
    }

    public String getSearchText() {
        return searchText;
    }

    public void setSearchText(String searchText) {
        this.searchText = searchText;
    }
""",
    "FocusGroupDTO getters",
)

# ---------- FocusGroup Criteria ----------
patch_file(
    ROOT / "service/criteria/FocusGroupCriteria.java",
    """    private StringFilter slug;

    private BooleanFilter isActive;""",
    """    private StringFilter slug;

    private StringFilter ocrText;

    private StringFilter searchText;

    private BooleanFilter isActive;""",
    "FocusGroupCriteria fields",
)

fgc = (ROOT / "service/criteria/FocusGroupCriteria.java").read_text(encoding="utf-8")
if "getOcrText()" not in fgc:
    old = """    public void setSlug(StringFilter slug) {
        this.slug = slug;
    }
"""
    # find setSlug
    idx = fgc.find("public void setSlug(StringFilter slug)")
    if idx < 0:
        print("MISS FocusGroupCriteria setSlug")
    else:
        # insert after setSlug method
        end = fgc.find("\n    public", idx + 10)
        # find closing of setSlug
        end = fgc.find("}", idx) + 1
        insert = """

    public StringFilter getOcrText() {
        return ocrText;
    }

    public void setOcrText(StringFilter ocrText) {
        this.ocrText = ocrText;
    }

    public StringFilter getSearchText() {
        return searchText;
    }

    public void setSearchText(StringFilter searchText) {
        this.searchText = searchText;
    }"""
        fgc = fgc[:end] + insert + fgc[end:]
        # also copy ctor
        fgc = fgc.replace(
            "this.slug = other.optionalSlug().map(StringFilter::copy).orElse(null);\n        this.isActive",
            "this.slug = other.optionalSlug().map(StringFilter::copy).orElse(null);\n        this.ocrText = other.ocrText == null ? null : other.ocrText.copy();\n        this.searchText = other.searchText == null ? null : other.searchText.copy();\n        this.isActive",
            1,
        )
        (ROOT / "service/criteria/FocusGroupCriteria.java").write_text(fgc, encoding="utf-8")
        print("OK [FocusGroupCriteria getters+copy]")

# ---------- FocusGroup QueryService ----------
patch_file(
    ROOT / "service/FocusGroupQueryService.java",
    """            if (criteria.getSlug() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSlug(), FocusGroup_.slug));
            }
            if (criteria.getIsActive() != null) {""",
    """            if (criteria.getSlug() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSlug(), FocusGroup_.slug));
            }
            if (criteria.getOcrText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getOcrText(), FocusGroup_.ocrText));
            }
            if (criteria.getSearchText() != null) {
                specification = specification.and(buildStringSpecification(criteria.getSearchText(), FocusGroup_.searchText));
            }
            if (criteria.getIsActive() != null) {""",
    "FocusGroupQueryService",
)

# EventDetailsCriteria getters - add if missing
edc = (ROOT / "service/criteria/EventDetailsCriteria.java").read_text(encoding="utf-8")
if "getOcrText()" not in edc:
    old = """    public void setDescription(StringFilter description) {
        this.description = description;
    }
"""
    new = """    public void setDescription(StringFilter description) {
        this.description = description;
    }

    public StringFilter getOcrText() {
        return ocrText;
    }

    public void setOcrText(StringFilter ocrText) {
        this.ocrText = ocrText;
    }

    public StringFilter getSearchText() {
        return searchText;
    }

    public void setSearchText(StringFilter searchText) {
        this.searchText = searchText;
    }
"""
    if old in edc:
        # also try copy constructor
        edc2 = edc.replace(old, new, 1)
        edc2 = edc2.replace(
            "this.description = other.description == null ? null : other.description.copy();",
            "this.description = other.description == null ? null : other.description.copy();\n        this.ocrText = other.ocrText == null ? null : other.ocrText.copy();\n        this.searchText = other.searchText == null ? null : other.searchText.copy();",
            1,
        )
        (ROOT / "service/criteria/EventDetailsCriteria.java").write_text(edc2, encoding="utf-8")
        print("OK [EventDetailsCriteria getters+copy]")
    else:
        print("MISS EventDetailsCriteria setDescription")

print("DONE")
