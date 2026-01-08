import { THREE } from 'zincjs';
import { HalfedgeDS } from 'three-mesh-halfedge'; // Note: Default export varies, check your import
import { mergeVertices } from 'zincjs/src/utilities.js';

export const getMergedGeometry = (geometry) => {
  if (geometry) {
    const newGeometry = mergeVertices(geometry);
    console.log("position", newGeometry.attributes.position.count);
    return newGeometry;
  }
  return undefined;
}

export const scaffoldSmoothing = (geometry, iterations = 1, lambda = 0.5) => {

  const index = geometry.index.array;
  const posAttribute = geometry.attributes.position;
  const numVertices = posAttribute.count;

  // 2. Build Adjacency List (The "Neighbor Graph")
  // Array of Sets, where neighbors[i] contains all vertex indices connected to vertex i
  const neighbors = new Array(numVertices).fill(null).map(() => new Set());

  for (let i = 0; i < index.length; i += 3) {
      const a = index[i];
      const b = index[i + 1];
      const c = index[i + 2];

      // Add connections (undirected graph)
      neighbors[a].add(b); neighbors[a].add(c);
      neighbors[b].add(a); neighbors[b].add(c);
      neighbors[c].add(a); neighbors[c].add(b);
  }

  // 3. Laplacian Smoothing Loop
  for (let k = 0; k < iterations; k++) {
      const newPositions = new Float32Array(posAttribute.array.length);

      for (let i = 0; i < numVertices; i++) {
          const myNeighbors = neighbors[i];

          // Get current position
          const currentX = posAttribute.getX(i);
          const currentY = posAttribute.getY(i);
          const currentZ = posAttribute.getZ(i);

          if (myNeighbors.size === 0) {
              // Isolated vertex? Keep it same.
              newPositions[i * 3] = currentX;
              newPositions[i * 3 + 1] = currentY;
              newPositions[i * 3 + 2] = currentZ;
              continue;
          }

          // Calculate Centroid (Average of neighbors)
          let sumX = 0, sumY = 0, sumZ = 0;
          for (const nIndex of myNeighbors) {
              sumX += posAttribute.getX(nIndex);
              sumY += posAttribute.getY(nIndex);
              sumZ += posAttribute.getZ(nIndex);
          }
          const avgX = sumX / myNeighbors.size;
          const avgY = sumY / myNeighbors.size;
          const avgZ = sumZ / myNeighbors.size;

          // Apply Smoothing Formula (Lerp)
          newPositions[i * 3]     = currentX + (avgX - currentX) * lambda;
          newPositions[i * 3 + 1] = currentY + (avgY - currentY) * lambda;
          newPositions[i * 3 + 2] = currentZ + (avgZ - currentZ) * lambda;
      }

      // Write new positions back to attribute for next iteration
      posAttribute.array.set(newPositions);
  }

  // 4. Final Cleanup
  posAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Smooths a Three.js geometry using Laplacian smoothing.
 * @param {THREE.BufferGeometry} geometry - The geometry to smooth.
 * @param {number} iterations - How many times to run the smoothing (e.g., 3).
 * @param {number} lambda - Strength of smoothing (0.0 to 1.0). Keep small (e.g., 0.5) to avoid collapse.
 */
export const scaffoldSmoothing2 = (geometry, iterations = 1, lambda = 0.5) => {
  if (geometry) {
    // 1. Convert Three.js geometry to Half-Edge structure
    // This builds the topology so we can find neighbors easily.
    const halfEdgeMesh = new HalfedgeDS();
    halfEdgeMesh.setFromGeometry(geometry, 1e-10);

    // We will update the position attribute directly
    const posAttribute = geometry.attributes.position;

    let diff = 0;

    console.log("original:", posAttribute.count, halfEdgeMesh.vertices.length);

    // 2. Perform smoothing iterations
    for (let i = 0; i < iterations; i++) {
      // We store new positions in a temporary array so we don't
      // read updated positions while still calculating the current pass.
      const newPositions = [];

      // Iterate over every vertex in the half-edge mesh
      for (const vertex of halfEdgeMesh.vertices) {

        // --- START NEIGHBOR TRAVERSAL ---
        const neighbors = [];
        let edge = vertex.halfedge;

        // Safety check: isolated vertices might have no edge
        if (edge) {
          const startEdge = edge;
          do {
            // The 'twin' points back to the vertex we came from,
            // so twin.vertex is the neighbor.
            neighbors.push(edge.twin.vertex);

            // Rotate around the vertex to the next spoke in the wheel
            edge = edge.twin.next;

          } while (edge !== startEdge);
        }
        // --- END NEIGHBOR TRAVERSAL ---

        if (neighbors.length === 0) {
          // If isolated, keep original position
          newPositions.push(vertex.position.clone());
          continue;
        }

        // 3. Calculate the centroid (average position) of neighbors
        const centroid = new THREE.Vector3();
        for (const neighbor of neighbors) {
          centroid.add(neighbor.position);
        }
        centroid.divideScalar(neighbors.length);

        // 4. Move vertex toward centroid based on lambda (smoothing factor)
        // formula: newPos = oldPos + lambda * (centroid - oldPos)
        const smoothedPos = new THREE.Vector3()
          .copy(vertex.position)
          .lerp(centroid, lambda);

        newPositions.push(smoothedPos);
      }


      // 5. Apply the calculated positions to the Half-Edge mesh for the next iteration
      // (and eventually to the Three.js geometry)
      halfEdgeMesh.vertices.forEach((vertex, index) => {
        diff += vertex.position.distanceTo(newPositions[index])
        vertex.position.copy(newPositions[index]);
      });
      console.log(`iteration ${i} diff: ${diff}`);
    }

    if (halfEdgeMesh?.vertices?.length) {
      halfEdgeMesh.vertices.forEach((vertex, index) => {
        // Update the actual Three.js BufferAttribute
        posAttribute.setXYZ(
          index, // The original index in the buffer
          vertex.position.x,
          vertex.position.y,
          vertex.position.z
        );
      });
    }

    // 6. Final Cleanup
    posAttribute.needsUpdate = true;       // Tell GPU positions changed
    geometry.computeVertexNormals();       // Re-calculate lighting
    console.log("delt", diff)
  }
}
