export class PinUtility {

    static stemID = null;
    static sphereID = null;

    static async createMeshes(stemLength, sphereIterations) {
        PinUtility.stemID = PinUtility.createPinStemMeshData(stemLength);
        PinUtility.sphereID = PinUtility.createPinSphereMeshData(stemLength, sphereIterations);
    }

    static createPinTransformationMatrix(selectionPosition, normal) {
        // rotate
        let i = 0;
        let min = normal.x;
        if (Math.abs(normal.y) < Math.abs(min)) {
            min = normal.y;
            i = 1;
        }
        if (Math.abs(normal.z) < Math.abs(min)) {
            i = 2;
        }

        const x = [0, 0, 0];
        x[i] = 1;
        const point = Communicator.Point3.createFromArray(x);

        const tangent0 = Communicator.Point3.cross(normal, point).normalize();
        const tangent1 = Communicator.Point3.cross(normal, tangent0);

        let matrix = new Communicator.Matrix();

        matrix.m = [
            normal.x, normal.y, normal.z, 0,
            tangent0.x, tangent0.y, tangent0.z, 0,
            tangent1.x, tangent1.y, tangent1.z, 0,
            0, 0, 0, 1];

        matrix = Communicator.Matrix.multiply(
            matrix,
            new Communicator.Matrix().setScaleComponent(
                this._sphereRadius,
                this._sphereRadius,
                this._sphereRadius,
            ),
        );

        matrix.setTranslationComponent(
            selectionPosition.x,
            selectionPosition.y,
            selectionPosition.z,
        );

        return matrix;
    }


    static async createPinStemMeshData(stemLength) {
        const meshData = new Communicator.MeshData();
        meshData.addPolyline([0, 0, 0, stemLength, 0, 0]);
        const meshid = await model.createMesh(meshData);
        return meshid;

        return meshData;
    }

    static async createPinStemInstance(viewer, matrix) {
        const pinStemMeshId = PinUtility.stemID;       

        const meshInstanceData = new Communicator.MeshInstanceData(
            pinStemMeshId,
            matrix,
            "pin-stem-instance",
            undefined,
            Communicator.Color.black(),
        );

        meshInstanceData.setOpacity(1);

        const instanceFlags =
            Communicator.MeshInstanceCreationFlags.SuppressCameraScale |
            Communicator.MeshInstanceCreationFlags.DoNotCut |
            Communicator.MeshInstanceCreationFlags.DoNotExplode |
            Communicator.MeshInstanceCreationFlags.DoNotXRay |
            Communicator.MeshInstanceCreationFlags.ExcludeBounding |
            Communicator.MeshInstanceCreationFlags.OverrideSceneVisibility |
            Communicator.MeshInstanceCreationFlags.AlwaysDraw;
        meshInstanceData.setCreationFlags(instanceFlags);

        return await viewer.model.createMeshInstance(meshInstanceData, undefined, true, true);
    }

    static async createPinSphereInstance(viewer, matrix) {
        const pinSphereMeshId = PinUtility.sphereID;
       

        const meshInstanceData = new Communicator.MeshInstanceData(
            pinSphereMeshId,
            matrix,
            "pin-sphere-instance",
            Communicator.Color.white(),
            undefined,
        );

        meshInstanceData.setOpacity(1);
        const instanceFlags =
            Communicator.MeshInstanceCreationFlags.SuppressCameraScale |
            Communicator.MeshInstanceCreationFlags.DoNotCut |
            Communicator.MeshInstanceCreationFlags.DoNotExplode |
            Communicator.MeshInstanceCreationFlags.DoNotXRay |
            Communicator.MeshInstanceCreationFlags.ExcludeBounding |
            Communicator.MeshInstanceCreationFlags.OverrideSceneVisibility |
            Communicator.MeshInstanceCreationFlags.AlwaysDraw;

        Communicator.meshInstanceData.setCreationFlags(instanceFlags);

      
        return await viewer.model.createMeshInstance(meshInstanceData, undefined, true, true);
    }


    static async createPinSphereMeshData(stemLength, sphereIterations) {
        const t = (1.0 + Math.sqrt(5.0)) / 2.0;

        const ratio = Math.sqrt(10 + 2 * Math.sqrt(5)) / (4 * t);
        const a = ratio / 2.0;
        const b = ratio / (2.0 * t);

        // calculate starting vertices
        const points = [];

        points[0] = new Communicator.Point3(-b, a, 0);
        points[1] = new Communicator.Point3(b, a, 0);
        points[2] = new Communicator.Point3(-b, -a, 0);
        points[3] = new Communicator.Point3(b, -a, 0);

        points[4] = new Communicator.Point3(0, -b, a);
        points[5] = new Communicator.Point3(0, b, a);
        points[6] = new Communicator.Point3(0, -b, -a);
        points[7] = new Communicator.Point3(0, b, -a);

        points[8] = new Communicator.Point3(a, 0, -b);
        points[9] = new Communicator.Point3(a, 0, b);
        points[10] = new Communicator.Point3(-a, 0, -b);
        points[11] = new Communicator.Point3(-a, 0, b);

        for (const point of points) {
            point.normalize();
        }

        // add starting faces
        let faces = [
            [0, 11, 5],
            [0, 5, 1],
            [0, 1, 7],
            [0, 7, 10],
            [0, 10, 11],

            [1, 5, 9],
            [5, 11, 4],
            [11, 10, 2],
            [10, 7, 6],
            [7, 1, 8],

            [3, 9, 4],
            [3, 4, 2],
            [3, 2, 6],
            [3, 6, 8],
            [3, 8, 9],

            [4, 9, 5],
            [2, 4, 11],
            [6, 2, 10],
            [8, 6, 7],
            [9, 8, 1],
        ];

        // refine sphere
        let count = 12;
        for (let i = 0; i < sphereIterations; i++) {
            const faces2 = [];
            faces.map((face) => {
                // TODO: every edge has two triangles, need to cache to prevent duplicate point creation

                const p0 = points[face[0]];
                const p1 = points[face[1]];
                const p2 = points[face[2]];

                points[count++] = new Communicator.Point3(p0.x + p1.x, p0.y + p1.y, p0.z + p1.z)
                    .scale(0.5)
                    .normalize();
                points[count++] = new Communicator.Point3(p1.x + p2.x, p1.y + p2.y, p1.z + p2.z)
                    .scale(0.5)
                    .normalize();
                points[count++] = new Communicator.Point3(p2.x + p0.x, p2.y + p0.y, p2.z + p0.z)
                    .scale(0.5)
                    .normalize();

                faces2.push([face[0], count - 3, count - 1]);
                faces2.push([count - 3, count - 2, count - 1]);
                faces2.push([count - 3, face[1], count - 2]);
                faces2.push([count - 2, face[2], count - 1]);
            });
            faces = faces2;
        }

        const vertexData = [];
        const normalData = [];
        for (const face of faces) {
            for (let i = 0; i < 3; i++) {
                const index = face[i];
                const point = points[index];

                vertexData.push(point.x + stemLength + 1);
                vertexData.push(point.y);
                vertexData.push(point.z);

                // By construction, the normal of the point *is* the point's normal.
                const normal = point.normalize();
                normalData.push(normal.x);
                normalData.push(normal.y);
                normalData.push(normal.z);
            }
        }

        // add mesh
        const meshData = new Communicator.MeshData();
        meshData.addFaces(vertexData, normalData);
        meshData.setFaceWinding(FaceWinding.CounterClockwise);
        const meshid = await model.createMesh(meshData);
        return meshid;
    }
}