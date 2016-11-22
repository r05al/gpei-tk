class Like < ActiveRecord::Base
  belongs_to :likeable, :polymorphic => true
  belongs_to :author, class_name: 'User', foreign_key: 'author_id'
end