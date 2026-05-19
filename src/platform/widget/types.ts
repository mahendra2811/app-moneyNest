export interface WidgetService {
  /** Trigger a redraw of all home-screen widgets. */
  refresh(): Promise<void>;
}
