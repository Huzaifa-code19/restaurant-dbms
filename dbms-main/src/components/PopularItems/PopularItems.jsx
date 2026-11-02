import {popularItems} from "../../data/mockData.js";
import "./PopularItems.css";



function PopularMenuItems() {
  const maxOrders = Math.max(
    ...popularItems.map((item) => item.totalOrders),
    1
  );

  return (
    <div className="popular-menu-card">
      <div className="popular-menu-header">
        <div>
          <h3>Popular Menu Items</h3>
          <p>Top-selling dishes this week</p>
        </div>

        <span className="popular-menu-badge">Top 5</span>
      </div>

      <div className="popular-menu-list">
        {popularItems.map((item, index) => {
          const percentage =
            (item.totalOrders / maxOrders) * 100;

          return (
            <div className="popular-menu-item" key={item.id}>
              <div className="popular-menu-rank">
                {index + 1}
              </div>

              <div className="popular-menu-info">
                <div className="popular-menu-item-header">
                  <div>
                    <h4>{item.name}</h4>
                    <span className="popular-menu-category">
                      {item.category}
                    </span>
                  </div>

                  <div className="popular-menu-stats">
                    <strong>{item.totalOrders}</strong>
                    <span>orders</span>
                  </div>
                </div>

                <div className="popular-menu-progress">
                  <div
                    className="popular-menu-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="popular-menu-footer">
                  <span>
                    Rs. {item.price.toLocaleString("en-PK")}
                  </span>
                  <span>{Math.round(percentage)}% popularity</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="popular-menu-bottom">
        Showing the 5 most ordered menu items
      </div>
    </div>
  );
}

export default PopularMenuItems;
