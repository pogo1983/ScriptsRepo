# Azure DevOps Tool - Project Structure

## File Organization

The project has been refactored into a modular structure for better maintainability:

```
AzureDevopsTool/
├── index.html              # Main HTML file
├── styles.css              # All CSS styles
├── script.js               # ⚠️ DEPRECATED - Keep for backup only
└── js/                     # Modular JavaScript files
    ├── main.js             # Application initialization
    ├── config.js           # Configuration management
    ├── utils.js            # Utility functions
    ├── workItems.js        # Work Items functionality (bulk comments)
    └── testClosure.js      # Test Closure Report functionality
```

## Module Descriptions

### `js/main.js` (~30 lines)
- Application initialization
- Event listeners setup
- Entry point for the application

### `js/config.js` (~125 lines)
- Configuration management
- Organization and Project dropdowns
- PAT token handling
- LocalStorage operations
- Comment templates definitions

### `js/utils.js` (~45 lines)
- UI utility functions
- Loading indicators
- Error/Success messages
- Tab switching logic

### `js/workItems.js` (~680 lines)
- Work Items fetching and display
- Bulk comment operations
- Child tasks detection (DEV/INT)
- Filtering and selection
- Comment generation and preview
- Azure DevOps Work Items API integration

### `js/testClosure.js` (~570 lines)
- Test Coverage Report generation
- Test Plan search functionality
- Test Suite details fetching
- Statistics calculation
- HTML report generation
- Azure DevOps Test Plans API integration

## Loading Order

Files are loaded in the following order (important for dependencies):
1. `config.js` - Defines config object and templates
2. `utils.js` - UI utilities needed by other modules
3. `workItems.js` - Work Items module (references config, utils)
4. `testClosure.js` - Test Closure module (references config, utils)
5. `main.js` - Initializes the application

## Features by Module

### Work Items Module
- Bulk comment addition to work items
- Multi-select work item types
- Exact/Contains matching for Planned Release
- Multiple version detection
- Existing comment detection
- DEV/INT task assignment display
- Filtering capabilities

### Test Closure Module
- Search by Test Plan ID or Release Number
- Automatic test result fetching
- Quality Gate calculation
- Executive Summary generation
- Detailed test results per suite
- Export to HTML (copy to clipboard)

## Benefits of Modular Structure

1. **Maintainability**: Each module has a single responsibility
2. **Readability**: Smaller files are easier to understand
3. **Reusability**: Functions can be reused across modules
4. **Testing**: Easier to test individual modules
5. **Collaboration**: Multiple developers can work on different modules
6. **Performance**: Browser can cache individual files

## Migration Notes

- The original `script.js` (1419 lines) is kept as backup
- All functionality has been preserved
- No breaking changes to the UI
- All global variables maintained for compatibility

## Development

To modify specific functionality:
- **Configuration/Settings**: Edit `js/config.js`
- **UI Messages/Tabs**: Edit `js/utils.js`
- **Bulk Comments**: Edit `js/workItems.js`
- **Test Reports**: Edit `js/testClosure.js`
- **Initialization**: Edit `js/main.js`
