# Network-Flow-Visualizer-HTML-Edition

This project is a desktop application built using Python, HTML, Javascript, and CSS that implements the Maximum Flow algorithm through an interactive graphical user interface (GUI). It allows users to construct directed networks, define source and sink nodes, and visualize maximum flow computations in real time. The tool is built with HTML, Javascript, and CSS for the GUI and NetworkX for graph algorithms.  

---

## User Interface

<img width="1865" height="1236" alt="image" src="https://github.com/user-attachments/assets/8f9f6fd7-7f01-45f6-a015-28262151f6c0" />


<img width="2155" height="1268" alt="image" src="https://github.com/user-attachments/assets/dc11c775-1309-4d64-a95b-ca392ca43bef" />

---

## What is Maximum Flow?

In graph theory, the **maximum flow problem** seeks the greatest possible rate at which material (such as data, water, or traffic) can move from a starting point (source) to an endpoint (sink) in a network, without exceeding the capacity of the connections (edges).  

The maximum flow algorithm is widely used in:
- **Computer networks** – optimizing data routing and bandwidth allocation  
- **Transportation systems** – modeling traffic or logistics  
- **Supply chains** – maximizing throughput across production lines  
- **Resource allocation** – solving real-world optimization problems  
- **Operations research** – studying bottlenecks in complex systems  

By visualizing flow, engineers and researchers can gain insight into how resources move through a system and where constraints occur.  

---

## Features

- **User-friendly GUI** built with HTML, Javascript, and CSS  
- **Dynamic input system** for adding and removing edges with custom capacities  
- **Source and sink node selection** for defining flow direction  
- **Maximum flow computation** powered by NetworkX  
- **Text-based results panel** summarizing flow values and edge-level distribution  
- **Real-time graph visualization** highlighting the fastest path  
- **Animated edge highlighting** to show how flow propagates through the network  

---

## User Interface

<img width="1857" height="1364" alt="image" src="https://github.com/user-attachments/assets/d7d6954a-6bf6-487a-a416-f6e86773db45" />

---

## How It Works

1. The user specifies:
   - Directed edges (with capacities) between nodes  
   - A source node (start)  
   - A sink node (end)  

2. The program constructs a directed graph using NetworkX.  

3. The algorithm calculates:
   - Maximum possible flow value  
   - Flow distribution across each edge  

4. Results are displayed in two ways:
   - A text panel showing the maximum flow and per-edge allocations  
   - A graph visualization where edge labels show flow/capacity and animated edges indicate flow  

---

## Installation and Usage

### Requirements
- Python 3.8+  
- NetworkX (for graph algorithms)  
- Matplotlib (for plotting)  


### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOURUSERNAME/network-flow-visualizer.git
   cd network-flow-visualizer

2. Install dependencies:
   ```bash
   pip install -r requirements.txt

3. Run the application
   ```bash   
   python src/network_flow_app.py

---

## Example

After launching the program:
  - Add edges by specifying From Node, To Node, and Capacity.
  - Define the Source and Sink nodes.
  - Click Solve & Visualize Flow to run the algorithm.

The program will display:
  - The maximum flow value in the results panel
  - A flow breakdown per edge
  - A graph visualization with animated edges showing flow vs. capacity

---

## Why This Project Matters

This project demonstrates:
  - Algorithms in action: Implementing and visualizing maximum flow in networks
  - Software engineering: Combining backend graph algorithms with a frontend GUI
  - Data visualization: Translating numerical results into intuitive network diagrams
  - User experience design: Building a desktop tool that is interactive and easy to use
  - By integrating computer science concepts with practical coding, this project highlights the ability to transform theoretical algorithms into engaging, usable software applications.
