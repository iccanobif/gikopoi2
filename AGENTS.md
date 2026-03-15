# Coding guidelines

## How to implement preferences
- Every preference should be in the GikopoipoiPreferences type
- The root component has a this.preferences object, all code should read preferences from there (other components should get the entire preference object as a prop).
- All writes to the preferences should be done with the setAndPersist() helper, which will update the preferences object and also persist the change to local storage.
- Use the isInfoboxVisible preference as a reference for how to implement this, since it already follows this pattern.


