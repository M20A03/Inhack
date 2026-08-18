export function mockAccessibilityServiceStatus(): boolean {
  // Read from local storage to mock the system state
  return localStorage.getItem('accessibility_service_enabled') === 'true';
}

export function toggleAccessibilityService(enabled: boolean) {
  localStorage.setItem('accessibility_service_enabled', String(enabled));
}

// Simulated action dispatcher that would normally run in the Android background service
export async function dispatchAccessibilityAction(actionType: string, payload?: any): Promise<boolean> {
  if (!mockAccessibilityServiceStatus()) {
    console.warn("Cannot dispatch action: Accessibility Service is not enabled.");
    return false;
  }
  
  console.log(`[Accessibility Service] Dispatching ${actionType}`, payload || '');
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
}
