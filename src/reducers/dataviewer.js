const VIEW_CHART = 'scratch-gui/dataviewer/VIEW_CHART';
const CLOSE_CHART = 'scratch-gui/dataviewer/CLOSE_CHART';
const SHRINK_EXPAND_CHART = 'scratch-gui/dataviewer/SHRINK_EXPAND_CHART';
const DRAG_CHART = 'scratch-gui/dataviewer/DRAG_CHART';
const START_DRAG = 'scratch-gui/dataviewer/START_DRAG';
const END_DRAG = 'scratch-gui/dataviewer/END_DRAG';

const initialState = {
    visible: false,
    expanded: true,
    x: 0,
    y: 0,
    dragging: false
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case VIEW_CHART:
        return Object.assign({}, state, {
            visible: true
        });
    case CLOSE_CHART:
        return Object.assign({}, state, {
            visible: false
        });
    case SHRINK_EXPAND_CHART:
        return Object.assign({}, state, {
            expanded: !state.expanded
        });
    case DRAG_CHART:
        return Object.assign({}, state, {
            x: action.x,
            y: action.y
        });
    case START_DRAG:
        return Object.assign({}, state, {
            dragging: true
        });
    case END_DRAG:
        return Object.assign({}, state, {
            dragging: false
        });
    default:
        return state;
    }
};

const viewChart = function () {
    return {type: VIEW_CHART};
};

const closeChart = function () {
    return {type: CLOSE_CHART};
};

const shrinkExpandChart = function () {
    return {type: SHRINK_EXPAND_CHART};
};

const dragChart = function (x, y) {
    return {type: DRAG_CHART, x, y};
};

const startDrag = function () {
    return {type: START_DRAG};
};

const endDrag = function () {
    return {type: END_DRAG};
};

export {
    reducer as default,
    initialState as dataviewerInitialState,
    viewChart,
    closeChart,
    shrinkExpandChart,
    dragChart,
    startDrag,
    endDrag
};
