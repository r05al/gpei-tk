class C4dToolkit < ActiveRecord::Base
  belongs_to :user
  has_many :c4d_articles
  has_many :c4d_toolkit_c4d_articles
  has_many :c4d_articles, :through => :c4d_toolkit_c4d_articles
end