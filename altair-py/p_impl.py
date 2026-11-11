import altair as alt
import pandas as pd
from pathlib import Path

data_path = Path(__file__).resolve().parent.parent / "penglings.csv"
df = pd.read_csv(data_path).dropna(
    subset=["flipper_length_mm", "body_mass_g", "bill_length_mm", "species"]
)

col_x = 'Flipper Length(mm)'
col_y = 'Body Mass (g)'
col_species = 'Species'
col_size = 'Bill Length (mm)'

chart = alt.Chart(df).mark_circle(opacity=0.8).encode(
    x=alt.X("flipper_length_mm:Q", title=col_x).scale(zero=False),
    y=alt.Y("body_mass_g:Q", title=col_y).scale(zero=False),
    color=alt.Color("species:N", title=col_species),
    size=alt.Size("bill_length_mm:Q", title=col_size)
).interactive().properties(width=800, height=800)

chart
    
    
    
