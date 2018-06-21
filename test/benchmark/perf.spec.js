import { dataframe, viz } from './data/dataframes-0';


suite('Interactivity', () => {
    benchmark('getFeaturesAtPosition', () => {
        dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz);
    });

    benchmark('getFeaturesAtPosition', () => {
        dataframe.getFeaturesAtPosition({ x: 0.5, y: 0.5 }, viz);
    });
});
