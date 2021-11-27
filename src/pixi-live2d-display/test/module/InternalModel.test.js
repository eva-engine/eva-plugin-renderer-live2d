import { Cubism2InternalModel, Cubism2ModelSettings } from '@/cubism2';
import { Cubism4InternalModel, Cubism4ModelSettings } from '@/cubism4';
import { TEST_MODEL, TEST_MODEL4 } from '../env';
import { MotionPreloadStrategy } from '@/cubism-common/index';

describe('InternalModel', function() {
    function createModel2(def) {
        return new Cubism2InternalModel(
            def.coreModel,
            new Cubism2ModelSettings(def.json),
            { motionPreload: MotionPreloadStrategy.NONE },
        );
    }

    function createModel4(def) {
        return new Cubism4InternalModel(
            def.coreModel,
            new Cubism4ModelSettings(def.json),
            { motionPreload: MotionPreloadStrategy.NONE },
        );
    }

    it('should emit events while updating', function() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');

        for (const model of [createModel2(TEST_MODEL), createModel4(TEST_MODEL4)]) {
            model.updateWebGLContext(gl, 0);

            const beforeMotionUpdate = sinon.spy();
            const afterMotionUpdate = sinon.spy();
            const beforeModelUpdate = sinon.spy();

            model.on('beforeMotionUpdate', beforeMotionUpdate);
            model.on('afterMotionUpdate', afterMotionUpdate);
            model.on('beforeModelUpdate', beforeModelUpdate);

            model.update(1000 / 60, performance.now());

            expect(beforeMotionUpdate).to.be.called;
            expect(afterMotionUpdate).to.be.called;
            expect(beforeModelUpdate).to.be.called;
        }
    });

    it('should provide access to drawables', function() {
        for (const model of [createModel2(TEST_MODEL), createModel4(TEST_MODEL4)]) {
            const drawableIDs = model.getDrawableIDs();

            expect(drawableIDs.length).to.be.greaterThan(10);

            expect(model.getDrawableIndex(drawableIDs[1])).to.equal(1);

            expect(model.getDrawableVertices(0).length).to.be.greaterThan(0);
        }
    });
});
