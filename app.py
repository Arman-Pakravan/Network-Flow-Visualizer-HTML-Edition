# app.py 
from flask import Flask, request, jsonify, render_template
import networkx as nx
import json

app = Flask(__name__)

def solve_max_flow(edges, source, sink):
    """
    edges: list of (u, v, capacity)
    Returns: (flow_value, flow_dict, G)
    """
    # aggregate duplicate edges (sum capacities)
    cap_map = {}
    for u, v, cap in edges:
        if cap < 0:
            raise ValueError("Capacities must be non-negative")
        cap_map[(u, v)] = cap_map.get((u, v), 0) + float(cap)

    G = nx.DiGraph()
    for (u, v), capacity in cap_map.items():
        G.add_edge(u, v, capacity=capacity)

    # Explicitly use Edmonds–Karp
    flow_value, flow_dict = nx.maximum_flow(
        G, source, sink, flow_func=nx.algorithms.flow.edmonds_karp
    )
    return flow_value, flow_dict, G


def extract_flow_paths(flow_dict, source, sink):
    """Extract readable flow paths with their flow values."""
    paths = []
    visited = set()

    def dfs(u, path, flow):
        if u == sink:
            paths.append((path[:], flow))
            return
        for v, f in flow_dict.get(u, {}).items():
            if f > 0 and (u, v) not in visited:
                visited.add((u, v))
                dfs(v, path + [v], min(flow, f))
                visited.remove((u, v))

    dfs(source, [source], float("inf"))
    return paths


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/solve", methods=["POST"])
def solve():
    data = request.get_json() or {}
    raw_edges = data.get("edges", [])  # expect list of [u, v, capacity]
    source = data.get("source")
    sink = data.get("sink")

    try:
        # validate minimal inputs
        if not source or not sink:
            return jsonify({"error": "Source and sink must be provided."}), 400
        if not raw_edges:
            return jsonify({"error": "At least one edge must be provided."}), 400

        max_flow, flow_dict, G = solve_max_flow(raw_edges, source, sink)

        # compute positions (layout) — return them so frontend can draw consistently
        pos = nx.spring_layout(G, seed=42)
        pos_serializable = {
            str(node): [float(pos[node][0]), float(pos[node][1])] for node in pos
        }

        # edge list with capacities
        edges_out = []
        for u, v, data_e in G.edges(data=True):
            edges_out.append([str(u), str(v), float(data_e.get("capacity", 0))])

        # ensure flow_dict is JSON-serializable
        flow_dict_serializable = {
            str(u): {str(v): float(f) for v, f in flows.items()}
            for u, flows in flow_dict.items()
        }

        # extract readable paths
        paths = extract_flow_paths(flow_dict_serializable, str(source), str(sink))
        paths_serializable = [{"path": p, "flow": f} for p, f in paths]

        response = {
            "max_flow": float(max_flow),
            "flow_dict": flow_dict_serializable,
            "positions": pos_serializable,
            "edges": edges_out,
            "nodes": list(map(str, G.nodes())),
            "paths": paths_serializable,  # NEW
        }

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True)
