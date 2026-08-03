"""
Sample map: every VALID-GPS sample plotted by real lat/lon, colored by
role, marked by pairing outcome. Samples with invalid GPS (e.g. (0,0)) are
EXCLUDED from the spatial plot and listed separately - including them
would blow out the axis scale and collapse every real point into an
unreadable corner, exactly what happened on the first attempt at this
module (see PROGRESS.md).
"""
import matplotlib.pyplot as plt
from ..core.geo import is_zero_gps


def plot_samples(samples_df, valid_pair_ids: set, rejected_ids: set, save_path: str):
    fig, ax = plt.subplots(figsize=(9, 7))

    color_map = {
        ("baseline", "treatment"): "tab:blue", ("monitoring", "treatment"): "tab:orange",
        ("baseline", "control"): "tab:green", ("monitoring", "control"): "tab:red",
    }

    excluded = []
    plotted_coords = {}  # track duplicates for label offsetting

    for _, row in samples_df.iterrows():
        if is_zero_gps(row["lat"], row["lon"]):
            excluded.append(row["sample_id"])
            continue

        color = color_map.get((row["type"], row["plot_type"]), "gray")
        marker = "o" if row["sample_id"] in valid_pair_ids else "x"
        edge = "black" if row["sample_id"] in rejected_ids else "none"
        ax.scatter(row["lon"], row["lat"], c=color, marker=marker,
                   s=120, edgecolors=edge, linewidths=1.5, zorder=3)

        # offset overlapping labels for co-located points (e.g. BL-001/BL-006/MON-004)
        key = (round(row["lon"], 5), round(row["lat"], 5))
        n_at_key = plotted_coords.get(key, 0)
        plotted_coords[key] = n_at_key + 1
        y_offset = 8 + n_at_key * 12

        ax.annotate(row["sample_id"].replace("GNG-", ""), (row["lon"], row["lat"]),
                    fontsize=8, xytext=(6, y_offset), textcoords="offset points")

    ax.set_xlabel("Longitude")
    ax.set_ylabel("Latitude")
    title = "Project Ganga - sample locations, roles, and pairing outcomes"
    if excluded:
        title += f"\n(excluded from plot, invalid GPS: {', '.join(s.replace('GNG-','') for s in excluded)})"
    ax.set_title(title, fontsize=11)

    legend_elements = [
        plt.Line2D([0], [0], marker='o', color='w', markerfacecolor=c, markersize=10, label=f"{typ}/{plot}")
        for (typ, plot), c in color_map.items()
    ]
    ax.legend(handles=legend_elements, loc='best', fontsize=8)

    fig.savefig(save_path, dpi=150, bbox_inches="tight")
    print(f"Saved map to {save_path}")
    if excluded:
        print(f"Excluded from spatial plot (invalid GPS): {excluded}")
